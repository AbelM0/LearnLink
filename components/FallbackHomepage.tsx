import React from 'react'
import { CreateClassDialog } from "@/components/CreateClassDialog";
import { JoinClassDialog } from "@/components/JoinClassDialog";
import Image from "next/image"
import illu from "@/assets/images/momo-studio-GdMVARrGMao-unsplash.jpg"
import { Button } from "@/components/ui/button";

import { useDialogStore } from "@/Stores/useDialogStore";

function FallbackHomepage() {
  const { openDialog } = useDialogStore();

  return (
    <div className="flex flex-col items-center">
        <CreateClassDialog />
        <JoinClassDialog />
        <Image
            src={illu}
            alt="User profile picture"
            width={300}
            height={300}
            className="bg-background"
          />
        <p className="text-center mt-2">Add a class to get started</p>
        <div className="flex gap-3 mt-2">
          <Button className='border-black'  onClick={() => openDialog("CreateClassDialog")} variant={"outline"}>Create a class</Button>
          <Button onClick={() => openDialog("JoinClassDialog")} >Join a class</Button>
        </div>
      </div>
  )
}

export default FallbackHomepage;