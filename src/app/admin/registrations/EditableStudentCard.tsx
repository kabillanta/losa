"use client";

import { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { updateStudentDetails } from "./actions";

export default function EditableStudentCard({ student }: { student: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(student.name);
  const [classDetails, setClassDetails] = useState(student.class_details || "");
  const [admNo, setAdmNo] = useState(student.admission_number || "");

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    
    const res = await updateStudentDetails(student.id, name, classDetails, admNo);
    
    if (res?.error) {
      setError(res.error);
    } else {
      setIsEditing(false);
    }
    
    setIsSaving(false);
  }

  function handleCancel() {
    setName(student.name);
    setClassDetails(student.class_details || "");
    setAdmNo(student.admission_number || "");
    setIsEditing(false);
    setError(null);
  }

  if (isEditing) {
    return (
      <div className="bg-white p-3 rounded-lg border border-primary-200 shadow-sm flex flex-col gap-2 relative transition-all">
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          className="font-semibold text-sm text-onyx border-b border-gray-200 pb-1 focus:outline-none focus:border-primary-500 bg-transparent w-full"
          placeholder="Student Name"
          disabled={isSaving}
        />
        <div className="flex items-center justify-between text-xs mt-1 gap-2">
          <input 
            type="text" 
            value={classDetails} 
            onChange={e => setClassDetails(e.target.value)}
            className="text-taupe border-b border-gray-200 pb-1 focus:outline-none focus:border-primary-500 bg-transparent w-1/2"
            placeholder="Class"
            disabled={isSaving}
          />
          <input 
            type="text" 
            value={admNo} 
            onChange={e => setAdmNo(e.target.value)}
            className="font-mono px-1 border-b border-gray-200 pb-1 focus:outline-none focus:border-primary-500 bg-transparent w-1/3 text-right"
            placeholder="Adm No"
            disabled={isSaving}
          />
        </div>
        
        {error && <p className="text-red-500 text-[10px] leading-tight mt-1">{error}</p>}
        
        <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
          <button 
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Cancel"
          >
            <X size={14} />
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !admNo.trim()}
            className="p-1 text-primary-600 hover:text-white hover:bg-primary-600 rounded transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Save"
          >
            {isSaving ? <div className="h-3 w-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /> : <Check size={14} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-1 relative hover:border-primary-200 transition-colors">
      <button 
        onClick={() => setIsEditing(true)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all"
        title="Edit details"
      >
        <Edit2 size={12} />
      </button>
      <span className="font-semibold text-sm text-onyx pr-6">{student.name}</span>
      <div className="flex items-center justify-between text-xs text-taupe mt-1">
        <span>{student.class_details}</span>
        <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{student.admission_number}</span>
      </div>
    </div>
  );
}
