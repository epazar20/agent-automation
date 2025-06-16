"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, User, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/types';
import { Customer } from '@/store/types';
import { setActiveCustomer, setSearchResults, setIsSearching } from '@/store/slices/customerSlice';
import { searchCustomers } from '@/api/customer';
import { toast } from 'sonner';

interface CustomerSearchProps {
  onCustomerSelect?: (customer: Customer) => void;
  placeholder?: string;
  label?: string;
  selectedCustomer?: Customer | null;
}

export default function CustomerSearch({ 
  onCustomerSelect, 
  placeholder = "Müşteri ara...",
  label = "Müşteri Seçimi",
  selectedCustomer
}: CustomerSearchProps) {
  const dispatch = useDispatch();
  const { activeCustomer, searchResults, isSearching } = useSelector((state: RootState) => state.customer);
  
  const [searchText, setSearchText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Update searchText when activeCustomer changes (for external updates)
  useEffect(() => {
    if (activeCustomer) {
      setSearchText(activeCustomer.fullName);
    } else {
      setSearchText('');
    }
  }, [activeCustomer]);

  // Handle selectedCustomer prop changes
  useEffect(() => {
    if (selectedCustomer && selectedCustomer !== activeCustomer) {
      dispatch(setActiveCustomer(selectedCustomer));
    }
  }, [selectedCustomer, activeCustomer, dispatch]);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (searchText.trim().length >= 2) {
      const timer = setTimeout(async () => {
        try {
          dispatch(setIsSearching(true));
          const customers = await searchCustomers(searchText.trim());
          dispatch(setSearchResults(customers));
          setShowResults(true);
        } catch (error) {
          console.error('Customer search failed:', error);
          toast.error('Müşteri arama başarısız oldu');
        } finally {
          dispatch(setIsSearching(false));
        }
      }, 300);

      setDebounceTimer(timer);
    } else {
      dispatch(setSearchResults([]));
      setShowResults(false);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [searchText, dispatch]);

  const handleCustomerSelect = (customer: Customer) => {
    dispatch(setActiveCustomer(customer));
    setSearchText(customer.fullName);
    setShowResults(false);
    dispatch(setSearchResults([]));
    onCustomerSelect?.(customer);
    toast.success(`Müşteri seçildi: ${customer.fullName}`);
  };

  const handleClearSelection = () => {
    dispatch(setActiveCustomer(null));
    setSearchText('');
    setShowResults(false);
    dispatch(setSearchResults([]));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    // If user clears the input, clear the active customer
    if (!value.trim() && activeCustomer) {
      dispatch(setActiveCustomer(null));
      dispatch(setSearchResults([]));
    }
    
    // If user starts typing and there's an active customer, clear it (unless they're typing the same name)
    if (activeCustomer && value.trim() !== activeCustomer.fullName) {
      dispatch(setActiveCustomer(null));
    }
  };

  return (
    <div className="space-y-2" ref={searchRef}>
      <Label>{label}</Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            value={searchText}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pl-10 pr-10"
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
          />
          {activeCustomer && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClearSelection}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
            <CardContent className="p-0">
              {searchResults.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center space-x-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {customer.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {customer.email} • {customer.phone}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {showResults && searchResults.length === 0 && searchText.trim().length >= 2 && !isSearching && !activeCustomer && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1">
            <CardContent className="p-4 text-center text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Müşteri bulunamadı</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Customer Info */}
      {activeCustomer && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activeCustomer.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {activeCustomer.id} • {activeCustomer.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 