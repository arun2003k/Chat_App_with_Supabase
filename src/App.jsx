import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";

function App() {
  const [session, setSession] = useState([]);
  const[messages, setMessages] = useState([]);
  const[newMessages, setNewMessages] = useState("");
  const[usersOnline, setUserOnline] = useState([]);
  const chatContainerRef= useRef(null);

  
  useEffect(() => { 

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  console.log(session);

  //sign in
 const redirectTo = process.env.NODE_ENV === 'production'
    ? 'https://arun2003k.github.io/Chat_App_with_Supabase'
    : 'http://localhost:3000';
  const signIn = async()=>{
    supabase.auth.signInWithOAuth({
      provider:"google",
      options: {
        options: { redirectTo }
      }
    });
    
  };

  //sign out
  const signOut = async()=>{
    const {error}= await supabase.auth.signOut();
    if(error){
      console.log("Sign-out error",error.message);
    }
  };

  useEffect(() =>{
    if(!session?.user){
      setUserOnline([]);
      return;
    }
 
    const roomOne = supabase.channel("room_one",{
      config:{
        presence:{
          key: session?.user?.id,
        },
      },
    });

    roomOne.on("broadcast", {event:"message"}, (payload)=>{
      setMessages((prevMessages)=> [...prevMessages, payload.payload])
      console.log(messages);
    });

    //track user presence
    roomOne.subscribe(async(status)=>{
      if(status==="SUBSCRIBED"){
        await roomOne.track({
          id:session?.user?.id,
        });
      }
    });

    //handle user presence
    roomOne.on("presence", {event:"sync"}, ()=>{
      const state=roomOne.presenceState();
      setUserOnline(Object.keys(state));
    });

    return() =>{
      roomOne.unsubscribe();
    };
  }, [session]); 

  // send message
  const sendMessage = async(e)=>{
    e.preventDefault()
    supabase.channel("room_one").send({
      type:"broadcast",
      event:"Message",
      payload:{
        message:newMessages,
        user_name:session?.user?.user_metadata?.email,
        avatar:session?.user?.user_metadata?.avatar_url,
        timestamp: new Date(). toISOString(),
      },
    });
    setNewMessages("");
  }

  const formatTime=(isoString)=>{
    return new Date(isoString).toLocaleTimeString("en-us",{
      hour:"numeric",
      minute:"2-digit",
      hour12:false,

    })
  }
  useEffect(()=>{
    setTimeout(() =>{
      if(chatContainerRef.current){
        chatContainerRef.current.scrollTop=chatContainerRef.current.scrollHeight;
      }
    }, [100])
  },[messages])

      if(!session){
        return(
          <div className="w-full flex h-screen justify-center items-center p-4">
            <button onClick={signIn}>Sign in with Google</button>
          </div>
        );
      }
      else{  return (
    <div className="w-full flex h-screen justify-center items-center p-4">
      <div className="border-[1px] border-gray-700 max-w-6xl w-full min-h-[600px] rounded-lg">
        {/* HEADER */}
        <div className="flex justify-between h-20 border-b-[1px] border-gray-700">
          <div className="p-4">
            <p className="text-gray-300">Signed in as name: {session?.user?.user_metadata?.full_name}</p>
            <p className="text-gray-300 italic text-sm">{usersOnline.length} user online</p>
          </div>
          <button onClick={signOut} className="m-2 sm:mr-4 text-white" >Sign Out</button>
        </div>
        {/* Main Chat Here */}
        <div ref={chatContainerRef} className="p-4 flex flex-col overflow-y-auto h-[500px]">
          {messages.map((msg, idx) =>(
            <div 
            key={idx}
            className={`my-2 flex w-full items-start ${
              msg?.user_name === session?.user?.email ?  "justify-end" : "justify-start"
            }`}>
                {/*received message avatar*/}

                {msg.user_name !=session?.user?.email &&
                (<img src={msg.avatar} alt="U2" className="w-10 h-10 rounded-full mr-2"/>)
                }
                <div className="flex flex-col w-full">
                  <div className={`p-1 max-w-[70%] rounded -xl ${
                    msg.user_name === session?.user?.email ? "bg-gray-700 text-white ml-auto" : 
                    "bg-gray-500 text-white mr-auto"
                  }`}>
                  <p>{msg.message}</p>
                  </div>
                  {/* time stamp*/}
                    <div className={`text-xs opacity-75 pt-1 ${msg?.user_name === session?.user?.email? "text-right mr-2" : "text-left-ml-2"
                    }`}
                    >
                      {formatTime(msg?.timestamp)}
                      </div>
                </div>
                  {msg.user_name===session?.user?.email &&(
                    <img src={msg.avatar} alt="U2" className="w-10 h-10 rounded-full ml-2"/>
                  )}

            </div>
          ))}
        </div>
        {/* message input*/}
        <form  onSubmit={sendMessage} className="flex flex-col sm:flex-row p-4 border-t-[1px] border-gray-700">
            <input value={newMessages} onChange={(e) => setNewMessages(e.target.value)} type="text" placeholder="Type a message..." className="p-2 w-full bg-[#00000040] rounded-lg" />
              <button className="mt-4 sm:mt-0 sm:ml-8 text-white max-h-12">Send</button>
              <span></span>
        </form>
      </div>
    </div>
  );
}
}

export default App;
