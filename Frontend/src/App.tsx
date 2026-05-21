import React from "react";
import Routing from "./utils/Routing";

const App: React.FC = () => {
  return (
    <div
      className="
      font-[gilroy] 
      flex 
      flex-col 
      justify-between 
      w-full 
      select-none
      
      min-h-screen 
      h-auto 
      overflow-y-auto
      
      md:h-screen 
      md:max-h-screen 
      md:overflow-hidden
    "
    >
      <Routing />
    </div>
  );
};

export default App;
