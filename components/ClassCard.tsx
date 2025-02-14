import React from 'react'
import Link from 'next/link';
import { Class } from '@/types/class-type';

interface classCardProps {
  clsData: Class;
}

export const ClassCard = ({clsData}: classCardProps) => {
  const cls = clsData;

  return (
      <Link href={`/class/${cls.id}`} key={cls.id}>
        <div
          key={cls.id}
          className='relative bg-background h-[296px] p-4 rounded-xl shadow-md border border-border overflow-hidden transition-all hover:shadow-lg cursor-pointer hover:bg-accent'
        >
          {/* Class Title */}
          <h2 className="text-xl font-semibold">{cls.className}</h2>
          
          {/* Subject */}
          <p className="text-sm opacity-90">{cls.subject}</p>

          {/* Description */}
          <p className="text-xs mt-2">{cls.description}</p>

          {/* Footer */}
          <div className="absolute bottom-2 right-2 text-xs">
            Created at: {new Date(cls.createdAt).toLocaleDateString()}
          </div>
        </div>
      </Link>
  )
}
