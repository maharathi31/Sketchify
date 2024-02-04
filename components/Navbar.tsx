"use client"
import { NavbarProps } from "@/types/type";
import Image from "next/image"
import {memo} from "react"
import ActiveUsers from "./users/ActiveUsers";
const Navbar = ({activeElement}:NavbarProps) => {
  return (
    <div className="flex select-none items-center
    justify-between gap-4 bg-primary-black px-5 text-white">
    <Image
    src="/assets/logo.svg"
    alt="logo"
    width={58} 
    height={20}/>
    <ActiveUsers/>
    </div>
  )
};

export default memo(Navbar, (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement);
