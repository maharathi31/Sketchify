"use client"
import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { defaultNavElement } from "@/constants/index";
import { handleCanvaseMouseMove, handleCanvasMouseDown, handleCanvasMouseUp, handleCanvasObjectModified, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { handleDelete } from "@/lib/key-events";
import { useMutation, useStorage } from "@/liveblocks.config";
import { ActiveElement } from "@/types/type";
import {fabric} from "fabric"
import {useEffect, useRef, useState} from 'react'

export default function Page() {

  const canvasRef=useRef<HTMLCanvasElement>(null)
  const fabricRef=useRef<fabric.Canvas | null>(null)
  const isDrawing=useRef(false)
  const shapeRef=useRef<fabric.Object | null>(null)
  const selectedShapeRef=useRef<string | null>('rectangle')
  const activeObjectRef=useRef<fabric.Object | null>(null)
  const [activeElement,setActiveElement]=useState<ActiveElement>({
    name:'',
    value:'',
    icon:''
  })

  const deleteAllShapes= useMutation(({storage})=>{
    const canvasObjects=storage.get('canvasObjects')

    if(!canvasObjects || canvasObjects.size==0)
    return true

    for(const[key] of canvasObjects.entries()){
      canvasObjects.delete(key)
    }

    return canvasObjects.size==0

  },[])
  const canvasObjects=useStorage((root)=>root.canvasObjects)

  const syncShapeInStorage=useMutation(({storage},object)=>{
    if(!object) return

    const {objectId}=object
    const shapeData=object.toJSON()
    shapeData.objectId=objectId

    const canvasObjects=storage.get('canvasObjects')

    canvasObjects.set(objectId,shapeData)
  },[])

  const deleteShapeFromStorage=useMutation(({
    storage
  },objectId)=>{
    const canvasObjects=storage.get('canvasObjects')
    canvasObjects.delete(objectId)
  },[])

  const handleActiveElement=(elem:ActiveElement)=>{
    setActiveElement(elem)

    switch(elem?.value){
      case 'reset':
        deleteAllShapes()
        fabricRef.current?.clear()
        setActiveElement(defaultNavElement)
        break
      
      case 'delete':
      handleDelete(fabricRef.current as any,
        deleteShapeFromStorage) 
        setActiveElement(defaultNavElement)
      default:
        break
    }

    selectedShapeRef.current=elem?.value as string
  }
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

    canvas.on("mouse:move",(options)=>{
      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage
      })
    })

    canvas.on("mouse:up",(options)=>{
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef
      })
    })

    canvas.on("object:modified",(options)=>{
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      })
    })


  window.addEventListener("resize",()=>{
    handleResize({fabricRef})
  })

  return ()=>{
    canvas.dispose()
  }
  },[])

  useEffect(()=>{
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef
    })
  })
  
  return (
      <div className="h-screen overflow-hidden">
      <Navbar
      activeElement={activeElement}
      handleActiveElement={handleActiveElement}/>
      <section className="flex h-full flex-row">
      <LeftSidebar/>
      <Live canvasRef={canvasRef}/>
      <RightSidebar/>
      </section>
      </div>
  );
}