import { useBroadcastEvent, useMyPresence, useOthers } from "@/liveblocks.config";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import { useCallback, useState } from "react";
import LiveCursors from "./cursor/LiveCursors";

const Live = () => {

    /**
   * useOthers returns the list of other users in the room.
   *
   * useOthers: https://liveblocks.io/docs/api-reference/liveblocks-react#useOthers
   */
  const others = useOthers();

  /**
   * useMyPresence returns the presence of the current user in the room.
   * It also returns a function to update the presence of the current user.
   *
   * useMyPresence: https://liveblocks.io/docs/api-reference/liveblocks-react#useMyPresence
   */
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;

  /**
   * useBroadcastEvent is used to broadcast an event to all the other users in the room.
   *
   * useBroadcastEvent: https://liveblocks.io/docs/api-reference/liveblocks-react#useBroadcastEvent
   */
   const broadcast = useBroadcastEvent();

   // store the reactions created on mouse click
   const [reactions, setReactions] = useState<Reaction[]>([]);
 
   // track the state of the cursor (hidden, chat, reaction, reaction selector)
   const [cursorState, setCursorState] = useState<CursorState>({
     mode: CursorMode.Hidden,
   });

   const handlePointerMove=useCallback((event:React.PointerEvent)=>{
    event.preventDefault()
    const x=event.clientX - event.currentTarget.getBoundingClientRect().x
    const y=event.clientY - event.currentTarget.getBoundingClientRect().y
    
    updateMyPresence({cursor:{x,y}})
   },[])

   const handlePointerLeave=useCallback((event:React.PointerEvent)=>{
    event.preventDefault()
   
    updateMyPresence({cursor:null,message:null})
   },[])

   const handlePointerDown=useCallback((event:React.PointerEvent)=>{
    
    const x=event.clientX - event.currentTarget.getBoundingClientRect().x
    const y=event.clientY - event.currentTarget.getBoundingClientRect().y
    
    updateMyPresence({cursor:{x,y}})
   },[])

  return <div
  onPointerMove={handlePointerMove}
  onPointerLeave={handlePointerLeave}
  onPointerDown={handlePointerDown}
  className="h-[100vh] w-full flex justify-center items-center text-center">
    <h1 className="text-5xl text-white">Figma Clone</h1>
    <LiveCursors others={others}/>
  </div>;
};

export default Live;
