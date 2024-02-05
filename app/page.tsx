"use client"
import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { defaultNavElement } from "@/constants/index";
import { handleCanvaseMouseMove, handleCanvasMouseDown, handleCanvasMouseUp, handleCanvasObjectModified, handleCanvasObjectScaling, handleCanvasSelectionCreated, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";
import { useMutation, useRedo, useStorage, useUndo } from "@/liveblocks.config";
import { ActiveElement, Attributes } from "@/types/type";
import {fabric} from "fabric"
import {useEffect, useRef, useState} from 'react'

export default function Page() {

  const undo=useUndo()
  const redo=useRedo()
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const fabricRef=useRef<fabric.Canvas | null>(null)
  const isDrawing=useRef(false)
  const shapeRef=useRef<fabric.Object | null>(null)
  const selectedShapeRef=useRef<string | null>(null)
  const activeObjectRef=useRef<fabric.Object | null>(null)
  const imageInputRef=useRef<HTMLInputElement>(null)
  const isEditingRef=useRef(true)
  const [activeElement,setActiveElement]=useState<ActiveElement>({
    name:'',
    value:'',
    icon:''
  })
  const [elementAttributes,setElementAttributes]=useState<Attributes>({
    width:'',
    height:'',
    fontSize:'',
    fontFamily:'',
    fontWeight:'',
    fill:'#aabbcc',
    stroke:'#aabbcc',

  })
  const deleteAllShapes= useMutation(({storage})=>{
    const canvasObjects=storage.get('canvasObjects')

    if(!canvasObjects || canvasObjects.size==0)
    return true

    canvasObjects.forEach((value, key) => {
      canvasObjects.delete(key);
    });

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
        break

      case 'image':
        imageInputRef.current?.click()
        isDrawing.current=false
        if(fabricRef.current){
          fabricRef.current.isDrawingMode=false
        }
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

    canvas.on("selection:created",(options)=>{
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      })
    })

    
  window.addEventListener("resize",()=>{
    handleResize({ fabricRef });
  })

  window.addEventListener("keydown",(e)=>{
   handleKeyDown({
    e,
    canvas:fabricRef.current,
    undo,
    redo,
    syncShapeInStorage,
    deleteShapeFromStorage
   })
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
      handleActiveElement={handleActiveElement}
      imageInputRef={imageInputRef}
      handleImageUpload={(e:any)=>{
        e.stopPropagation()

        handleImageUpload({
          file:e.target.files[0],
          canvas:fabricRef as any,
          shapeRef,
          syncShapeInStorage
        })
      }}/>
      <section className="flex h-full flex-row">
      <LeftSidebar allShapes={Array.from (canvasObjects)}/>
      <Live canvasRef={canvasRef}/>
      <RightSidebar
      elementAttributes={elementAttributes}
      setElementAttributes={setElementAttributes}
      fabricRef={fabricRef}
      isEditingRef={isEditingRef}
      activeObjectRef={activeObjectRef}
      syncShapeInStorage={syncShapeInStorage}/>
      </section>
      </div>
  );
}