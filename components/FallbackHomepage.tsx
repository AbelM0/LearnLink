import React from 'react'
import { CreateClassDialog } from "@/components/CreateClassDialog";
import { JoinClassDialog } from "@/components/JoinClassDialog";
import Image from "next/image"
import illu from "@/assets/images/ChatGPT Image Apr 10, 2025, 10_53_43 AM.png"
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
            alt="Home picture"
            width={300}
            height={300}
          />
        <p className="text-center mt-2">Add a class to get started</p>
        <div className="flex gap-3 mt-2">
          <Button className='border-border'  onClick={() => openDialog("CreateClassDialog")} variant={"outline"}>Create a class</Button>
          <Button onClick={() => openDialog("JoinClassDialog")} >Join a class</Button>
        </div>
      </div>
  )
}

export default FallbackHomepage;