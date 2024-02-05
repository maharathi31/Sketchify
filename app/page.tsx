"use client"
import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { handleCanvasMouseDown, handleResize, initializeFabric } from "@/lib/canvas";
import {fabric} from "fabric"
import {useEffect, useRef} from 'react'

export default function Page() {

  const canvasRef=useRef<HTMLCanvasElement>(null)
  const fabricRef=useRef<fabric.Canvas | null>(null)
  const isDrawing=useRef(false)
  const shapeRef=useRef<fabric.Object | null>(null)
  const selectedShapeRef=useRef<string | null>('rectangle')

  useEffect(()=>{
    const canvas=initializeFabric({canvasRef,fabricRef})

    canvas.on("mouse:down",(options)=>{
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef
      })
    })

  window.addEventListener("resize",()=>{
    handleResize({fabricRef})
  })
  },[])

  
  return (
      <div className="h-screen overflow-hidden">
      <Navbar/>
      <section className="flex h-full flex-row">
      <LeftSidebar/>
      <Live canvasRef={canvasRef}/>
      <RightSidebar/>
      </section>
      </div>
  );
}