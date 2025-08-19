'use client';

import React, { useState, useEffect } from 'react';

export interface AttributeData {
  name: string;
  values: string[];
  originalNames: string[]; // Track original names for merging
  originalValues: string[]; // Preserve original values for mapping
}

interface AttributeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attributes: AttributeData[]) => void;
  initialAttributes: Record<string, string[]>;
}

export const AttributeEditorModal: React.FC<AttributeEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAttributes
}) => {
  const [attributes, setAttributes] = useState<AttributeData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && initialAttributes) {
      // Convert initial attributes to our format
      const convertedAttributes: AttributeData[] = Object.entries(initialAttributes).map(([name, values]) => {
        const unique = Array.from(new Set(values));
        return {
          name,
          values: unique.slice(),
          originalNames: [name],
          originalValues: unique.slice()
        };
      });
      setAttributes(convertedAttributes);
      setErrors({});
    }
  }, [isOpen, initialAttributes]);

  const handleAttributeNameChange = (index: number, newName: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index] = {
      ...updatedAttributes[index],
      name: newName
    };
    setAttributes(updatedAttributes);
    
    // Clear error for this field
    const newErrors = { ...errors };
    delete newErrors[`name-${index}`];
    setErrors(newErrors);
  };

  const handleAttributeValueChange = (attrIndex: number, valueIndex: number, newValue: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attrIndex].values[valueIndex] = newValue;
    setAttributes(updatedAttributes);
    
    // Clear error for this field
    const newErrors = { ...errors };
    delete newErrors[`value-${attrIndex}-${valueIndex}`];
    setErrors(newErrors);
  };

  const addAttributeValue = (attrIndex: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attrIndex].values.push('');
    // Keep originalValues aligned for mapping logic
    updatedAttributes[attrIndex].originalValues.push('');
    setAttributes(updatedAttributes);
  };

  const removeAttributeValue = (attrIndex: number, valueIndex: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attrIndex].values.splice(valueIndex, 1);
    // Remove corresponding original value to keep indexes aligned
    updatedAttributes[attrIndex].originalValues.splice(valueIndex, 1);
    setAttributes(updatedAttributes);
  };

  const mergeAttributes = (targetIndex: number, sourceIndex: number) => {
    const updatedAttributes = [...attributes];
    const target = updatedAttributes[targetIndex];
    const source = updatedAttributes[sourceIndex];
    
    // Merge values and original names
    // Preserve order to keep index mapping between originalValues and values
    target.values = [...target.values, ...source.values];
    target.originalNames = [...target.originalNames, ...source.originalNames];
    // Merge originalValues to keep mapping pairs
    target.originalValues = [...target.originalValues, ...source.originalValues];
    
    // Remove the source attribute
    updatedAttributes.splice(sourceIndex, 1);
    setAttributes(updatedAttributes);
  };

  const validateAttributes = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    attributes.forEach((attr, attrIndex) => {
      // Validate attribute name
      if (!attr.name.trim()) {
        newErrors[`name-${attrIndex}`] = 'Attribute name cannot be empty';
      }
      
      // Validate attribute values
      attr.values.forEach((value, valueIndex) => {
        if (!value.trim()) {
          newErrors[`value-${attrIndex}-${valueIndex}`] = 'Attribute value cannot be empty';
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateAttributes()) {
      onSave(attributes);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Product Attributes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {attributes.map((attr, attrIndex) => (
            <div key={attrIndex} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attribute Name
                  </label>
                  <input
                    type="text"
                    value={attr.name}
                    onChange={(e) => handleAttributeNameChange(attrIndex, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-right ${
                      errors[`name-${attrIndex}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    dir="rtl"
                    placeholder="שם התכונה"
                  />
                  {errors[`name-${attrIndex}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`name-${attrIndex}`]}</p>
                  )}
                </div>
                
                <div className="ml-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Names
                  </label>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {attr.originalNames.join(', ')}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attribute Values
                </label>
                <div className="space-y-2">
                  {attr.values.map((value, valueIndex) => (
                    <div key={valueIndex} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleAttributeValueChange(attrIndex, valueIndex, e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-md text-right ${
                          errors[`value-${attrIndex}-${valueIndex}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        dir="rtl"
                        placeholder="ערך התכונה"
                      />
                      <button
                        onClick={() => removeAttributeValue(attrIndex, valueIndex)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        disabled={attr.values.length <= 1}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {errors[`value-${attrIndex}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`value-${attrIndex}`]}</p>
                  )}
                </div>
                <button
                  onClick={() => addAttributeValue(attrIndex)}
                  className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                >
                  + Add Value
                </button>
              </div>

              <div className="flex justify-end space-x-2">
                {attributes.length > 1 && (
                  <button
                    onClick={() => {
                      const nextIndex = (attrIndex + 1) % attributes.length;
                      mergeAttributes(attrIndex, nextIndex);
                    }}
                    className="px-4 py-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-md"
                  >
                    Merge with Next
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
