import useInterval from "@/hooks/useInterval";
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@/liveblocks.config";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import LiveCursors from "./cursor/LiveCursors";
import FlyingReaction from "./reaction/FlyingReaction";
import ReactionSelector from "./reaction/ReactionButton";

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
   const [reaction, setReaction] = useState<Reaction[]>([]);

   // track the state of the cursor (hidden, chat, reaction, reaction selector)
   const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  // Remove reactions that are not visible anymore (every 1 sec)
  useInterval(() => {
    setReaction((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000));
  }, 1000);

  // Broadcast the reaction to other users (every 100ms)
  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      // concat all the reactions created on mouse click
      setReaction((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );

      // Broadcast the reaction to other users
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  /**
   * useEventListener is used to listen to events broadcasted by other
   * users.
   *
   * useEventListener: https://liveblocks.io/docs/api-reference/liveblocks-react#useEventListener
   */
   useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReaction((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ])
    );
  });

 
   const handlePointerMove=useCallback((event:React.PointerEvent)=>{
    event.preventDefault()

    if(cursor==null || cursorState.mode!=CursorMode.ReactionSelector){
    const x=event.clientX - event.currentTarget.getBoundingClientRect().x
    const y=event.clientY - event.currentTarget.getBoundingClientRect().y
    updateMyPresence({cursor:{x,y}})
    }
   },[])

   const handlePointerLeave=useCallback((event:React.PointerEvent)=>{
    event.preventDefault()
   
    updateMyPresence({cursor:null,message:null})
   },[])

   const handlePointerUp=useCallback((event:React.PointerEvent)=>{

   setCursorState((state:CursorState)=>cursorState.mode===CursorMode.Reaction?
    {...state,isPressed:true}:cursorState)
   },[cursorState.mode,setCursorState])

   const handlePointerDown=useCallback((event:React.PointerEvent)=>{
    
    const x=event.clientX - event.currentTarget.getBoundingClientRect().x
    const y=event.clientY - event.currentTarget.getBoundingClientRect().y
    
    updateMyPresence({cursor:{x,y}})

    setCursorState((state:CursorState)=>cursorState.mode===CursorMode.Reaction?
    {...state,isPressed:true}:state)
   },[cursorState.mode,setCursorState])

   useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  const setReactions=useCallback((reaction:string)=>{
setCursorState({mode:CursorMode.Reaction,reaction,isPressed:false})
  },[])

  return <div
  onPointerMove={handlePointerMove}
  onPointerLeave={handlePointerLeave}
  onPointerDown={handlePointerDown}
  onPointerUp={handlePointerUp}
  className="h-[100vh] w-full flex justify-center items-center text-center"
  >
    <h1 className="text-5xl text-white">Figma Clone</h1>

  {/* Render the reactions */}
  {reaction.map((r) => (
          <FlyingReaction
            key={r.timestamp.toString()}
            x={r.point.x}
            y={r.point.y}
            timestamp={r.timestamp}
            value={r.value}
          />
        ))}

    {cursor && (<CursorChat
    cursor={cursor}
    cursorState={cursorState}
    setCursorState={setCursorState}
    updateMyPresence={updateMyPresence}/>)}

    {cursorState.mode===CursorMode.ReactionSelector && (
      <ReactionSelector
      setReaction={setReactions}/>
    )}
    <LiveCursors others={others}/>
  </div>;
};

export default Live;
