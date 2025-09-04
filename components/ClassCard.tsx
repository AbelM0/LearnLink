import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Class } from '@/types/class-type';
import bannerPlaceholder1 from "@/assets/images/codioful-formerly-gradienta-QWutu2BRpOs-unsplash.jpg";
import bannerPlaceholder2 from "@/assets/images/codioful-formerly-gradienta-BgrRH1_ZI5Y-unsplash.jpg";
import bannerPlaceholder3 from "@/assets/images/codioful-formerly-gradienta-gwE9vXSi7Xw-unsplash.jpg";

interface classCardProps {
  clsData: Class;
}

export const ClassCard = ({ clsData }: classCardProps) => {
  // Truncate title and description if too long
  const truncatedTitle = clsData.className.length > 30 ? clsData.className.slice(0, 27) + "..." : clsData.className;
  const truncatedDescription = clsData.description.length > 100 ? clsData.description.slice(0, 97) + "..." : clsData.description;

  const banners = [bannerPlaceholder1, bannerPlaceholder2, bannerPlaceholder3];

  const randomBanner = banners[Math.floor(Math.random() * banners.length)];

  return (
    <Link href={`/class/${clsData.id}`} key={clsData.id}>
      <div className="relative bg-card rounded-xl shadow-md border border-border transition-all hover:shadow-lg cursor-pointer hover:bg-accent w-[300px] h-[296px] overflow-hidden flex flex-col">
        {/* Banner Image */}
        <div className="w-full h-[120px] relative rounded-t-xl overflow-hidden">
          <Image
            fill
            src={clsData.imageUrl}
            alt="class banner image"
            style={{ objectFit: "fill" }}
            priority
            className="rounded-t-xl"
          />
        </div>

        {/* Class Content (Flex-grow makes this take available space) */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Class Name */}
          <h2 className="text-lg font-semibold truncate">{truncatedTitle}</h2>

          {/* Subject */}
          <p className="text-sm opacity-80">{clsData.subject}</p>

          {/* Description */}
          <p className="text-xs mt-1 opacity-70 line-clamp-2">
            {truncatedDescription}
          </p>

          {/* Footer (Online & Members) - This stays at the bottom */}
          <div className="mt-auto flex justify-between text-xs opacity-60 pt-3 border-t border-border">
            <span>🟢 {Math.floor(Math.random() * 1000)} Online</span>
            <span>👥 {Math.floor(Math.random() * 10000)} Members</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

