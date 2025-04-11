import React, { useEffect, useState } from 'react';
import { getUserInfo } from '@/app/class/[id]/actions';
import Image from 'next/image';
import avatarPlaceholder from "@/assets/images/avatar_placeholder.png";

interface MessageProps {
  data: {
    content: string;
    userId: string;
    channelId: number;
    id: number;
    createdAt: Date;
    updatedAt: Date;
  }
}

export default function Message({ data }: MessageProps) {
   const [userData, setUserData] = useState<{
     name: string | null;
     image: string | null;
   } | null>(null);

   
  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = await getUserInfo(data.userId);
      setUserData(user);
    };

    fetchUserInfo();
  }, [data.userId]);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Date(date).toLocaleString("en-US", options);
  };

   if (!userData) {
     return (
       <div key={data.id}>
         <p>Loading...</p>
       </div>
     );
   }

   const formattedDate = formatDate(data.createdAt);

  return (
    <div key={data.id} className="py-1 rounded-md flex gap-3">
      <Image
        src={userData.image || avatarPlaceholder}
        alt="User profile picture"
        width={50}
        height={50}
        className="aspect-square rounded-full bg-background object-cover"
      />
      <div className="items-center">
        <div className='flex gap-4 items-center'>
          <p className="text-gray-400">{userData.name}</p>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>

        <div>{data.content}</div>
      </div>
    </div>
  );
}
