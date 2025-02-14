"use client"

import * as React from "react"
import { useState } from "react"
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDialogStore } from "@/Stores/useDialogStore";
import { Plus } from "lucide-react";
import { CreateClassDialog } from "./CreateClassDialog"
import { JoinClassDialog } from "./JoinClassDialog"

export function CreateJoinDropdown() {
  const [ open, setOpen ] = useState(false);
  const { openDialog } = useDialogStore();

  return (
    <div>
      <CreateClassDialog />
      <JoinClassDialog />
      <DropdownMenu open = {open}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full border-border"  onClick={() => setOpen(true)}><Plus /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 bg-background/75 backdrop-blur-md mr-3 border-border cursor-pointer items-center p-0" onBlur={() => {setOpen(false)}}>
        <div className="text-center hover:bg-accent m-0 py-2" onClick={() => {
          openDialog("CreateClassDialog");
          setOpen(false)
          }}>Create a class</div>
        <DropdownMenuSeparator className="border-border m-0"/>
        <div className="text-center hover:bg-accent py-2" onClick={() => {
          openDialog("JoinClassDialog");
          setOpen(false)
          }} >Join a class</div>       
      </DropdownMenuContent>
      </DropdownMenu>
    </div>

  )
}


                    
                  