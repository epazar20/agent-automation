"use client";

import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, X, Plus, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateNode, removeNode } from '@/store/slices/flowSlice';
import { RootState } from '@/store/types';
import { ConditionalConfig } from '@/store/types';
import { toast } from 'sonner';

interface ConditionalNodeProps {
  id: string;
  data: {
    config: ConditionalConfig;
    nodeType: 'general' | 'business';
  };
}

const operatorLabels = {
  equals: 'Eşittir (=)',
  notEquals: 'Eşit Değildir (≠)',
  contains: 'İçerir',
  notContains: 'İçermez',
  greaterThan: 'Büyüktür (>)',
  lessThan: 'Küçüktür (<)',
  greaterThanOrEqual: 'Büyük Eşittir (≥)',
  lessThanOrEqual: 'Küçük Eşittir (≤)',
  startsWith: 'İle Başlar',
  endsWith: 'İle Biter',
  isEmpty: 'Boş',
  isNotEmpty: 'Boş Değil',
  like: 'Benzer (%)',
  notLike: 'Benzer Değil'
};

export default function ConditionalNode({ id, data }: ConditionalNodeProps) {
  const dispatch = useDispatch();
  const [config, setConfig] = useState<ConditionalConfig>(data.config);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const executionResults = useSelector((state: RootState) => state.flow.executionResults);
  const edges = useSelector((state: RootState) => state.flow.edges);

  // Get execution status and result from redux
  const executionStatus = useSelector((state: RootState) =>
    state.flow.executionResults[id]?.status || 'idle'
  );

  const sourceEdge = edges.find(edge => edge.target === id);
  const previousResult = sourceEdge ? executionResults[sourceEdge.source]?.output : null;

  useEffect(() => {
    if (data.config) {
      setConfig(data.config);
    }
  }, [data.config]);

  const handleSave = () => {
    dispatch(updateNode({
      id,
      updates: {
        data: {
          ...data,
          config,
          nodeType: data.nodeType,
        },
      },
    }));
    setIsConfigOpen(false);
    toast.success('Yapılandırma kaydedildi');
  };

  const addCondition = () => {
    const newCondition = {
      id: Date.now().toString(),
      value1: {
        type: 'variable' as const,
        value: 'result'
      },
      operator: 'equals' as const,
      value2: {
        type: 'static' as const,
        value: ''
      }
    };

    setConfig({
      ...config,
      conditions: [...config.conditions, newCondition]
    });
  };

  const removeCondition = (conditionId: string) => {
    setConfig({
      ...config,
      conditions: config.conditions.filter(c => c.id !== conditionId)
    });
  };

  const updateCondition = (conditionId: string, updates: any) => {
    setConfig({
      ...config,
      conditions: config.conditions.map(c => 
        c.id === conditionId ? { ...c, ...updates } : c
      )
    });
  };

  const getValue = (valueConfig: { type: 'variable' | 'static'; value: string }, data: any) => {
    if (valueConfig.type === 'variable') {
      // Navigate through nested object properties
      const keys = valueConfig.value.split('.');
      let result = data;
      for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
          result = result[key];
        } else {
          return undefined;
        }
      }
      return result;
    }
    return valueConfig.value;
  };

  const evaluateCondition = (condition: any, data: any) => {
    const value1 = getValue(condition.value1, data);
    const value2 = getValue(condition.value2, data);

    switch (condition.operator) {
      case 'equals':
        return value1 === value2;
      case 'notEquals':
        return value1 !== value2;
      case 'contains':
        return String(value1).includes(String(value2));
      case 'notContains':
        return !String(value1).includes(String(value2));
      case 'greaterThan':
        return Number(value1) > Number(value2);
      case 'lessThan':
        return Number(value1) < Number(value2);
      case 'greaterThanOrEqual':
        return Number(value1) >= Number(value2);
      case 'lessThanOrEqual':
        return Number(value1) <= Number(value2);
      case 'startsWith':
        return String(value1).startsWith(String(value2));
      case 'endsWith':
        return String(value1).endsWith(String(value2));
      case 'isEmpty':
        return !value1 || value1 === '' || (Array.isArray(value1) && value1.length === 0);
      case 'isNotEmpty':
        return value1 && value1 !== '' && (!Array.isArray(value1) || value1.length > 0);
      case 'like':
        const likePattern = String(value2).replace(/%/g, '.*');
        return new RegExp(likePattern, 'i').test(String(value1));
      case 'notLike':
        const notLikePattern = String(value2).replace(/%/g, '.*');
        return !new RegExp(notLikePattern, 'i').test(String(value1));
      default:
        return false;
    }
  };

  const evaluateAllConditions = (data: any) => {
    if (!config.conditions || config.conditions.length === 0) return false;

    const results = config.conditions.map(condition => evaluateCondition(condition, data));
    
    if (config.combineOperator === 'AND') {
      return results.every(result => result);
    } else {
      return results.some(result => result);
    }
  };

  const getNodeColor = () => {
    // First check if this ConditionalNode has been executed and has a stored condition result
    const ownResult = executionResults[id];
    
    if (ownResult?.status === 'completed' && typeof ownResult.conditionResult === 'boolean') {
      // Use the stored condition result from execution
      return ownResult.conditionResult ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
    }
    
    // If not executed yet, show default gray
    if (!previousResult) return 'bg-gray-100 dark:bg-gray-800';
    
    // Fallback: evaluate condition in real-time (for preview before execution)
    const result = evaluateAllConditions(previousResult);
    return result ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
  };

  const getConditionSummary = () => {
    if (!config.conditions || config.conditions.length === 0) {
      return 'Koşul tanımlanmamış';
    }

    if (config.conditions.length === 1) {
      const condition = config.conditions[0];
      return `${condition.value1.value} ${operatorLabels[condition.operator]} ${condition.value2.value}`;
    }

    return `${config.conditions.length} koşul (${config.combineOperator})`;
  };

  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-muted-foreground dark:!bg-muted-foreground group-hover:!bg-primary"
        id="target"
      />

      {/* Action Buttons */}
      <div className="absolute -top-2 -right-2 z-10 flex space-x-1">
        <Button
          size="icon"
          variant="secondary"
          className="h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setIsConfigOpen(true);
          }}
        >
          <Settings className="h-3 w-3" />
        </Button>

        <Button
          size="icon"
          variant="destructive"
          className="h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(removeNode(id));
            toast.success('Node silindi');
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <Card
        className={`w-48 cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-200 relative ${getNodeColor()}`}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsConfigOpen(true);
        }}
      >
        <CardHeader className="p-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Koşul Kontrolü</span>
              <span className="text-xs text-muted-foreground">
                {getConditionSummary()}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Koşul Yapılandırması</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Conditions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Koşullar</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Koşul Ekle</span>
                </Button>
              </div>

              {config.conditions.map((condition, index) => (
                <div key={condition.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Koşul {index + 1}</span>
                    {config.conditions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(condition.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Value 1 */}
                    <div className="space-y-2">
                      <Label>Değer 1</Label>
                      <Select
                        value={condition.value1.type}
                        onValueChange={(value: 'variable' | 'static') => 
                          updateCondition(condition.id, {
                            value1: { ...condition.value1, type: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="variable">Değişken</SelectItem>
                          <SelectItem value="static">Sabit Değer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={condition.value1.value}
                        onChange={(e) => 
                          updateCondition(condition.id, {
                            value1: { ...condition.value1, value: e.target.value }
                          })
                        }
                        placeholder={condition.value1.type === 'variable' ? 'result.field' : 'Değer girin'}
                      />
                    </div>

                    {/* Operator */}
                    <div className="space-y-2">
                      <Label>Operatör</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value: any) => 
                          updateCondition(condition.id, { operator: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(operatorLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value 2 */}
                    <div className="space-y-2">
                      <Label>Değer 2</Label>
                      <Select
                        value={condition.value2.type}
                        onValueChange={(value: 'variable' | 'static') => 
                          updateCondition(condition.id, {
                            value2: { ...condition.value2, type: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="variable">Değişken</SelectItem>
                          <SelectItem value="static">Sabit Değer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={condition.value2.value}
                        onChange={(e) => 
                          updateCondition(condition.id, {
                            value2: { ...condition.value2, value: e.target.value }
                          })
                        }
                        placeholder={condition.value2.type === 'variable' ? 'result.field' : 'Değer girin'}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Combine Operator */}
            {config.conditions.length > 1 && (
              <div className="space-y-2">
                <Label>Koşulları Birleştir</Label>
                <Select
                  value={config.combineOperator}
                  onValueChange={(value: 'AND' | 'OR') => 
                    setConfig({ ...config, combineOperator: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">VE (AND) - Tüm koşullar sağlanmalı</SelectItem>
                    <SelectItem value="OR">VEYA (OR) - En az bir koşul sağlanmalı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button className="w-full" onClick={handleSave}>
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* True Path Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 !bg-green-500"
        style={{ left: '30%' }}
      />

      {/* False Path Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 !bg-red-500"
        style={{ left: '70%' }}
      />
    </div>
  );
} 