import React from "react"
import { useCan } from "../hook/useCan";

interface ICanProps {
  children: React.ReactNode;
  permissions?: Array<string>;
  roles?: Array<string>;
}


const Can = ({ children, permissions, roles }: ICanProps) => {
  const userCanSeeComponent = useCan({ permissions, roles });

  if (!userCanSeeComponent) {
    return null;
  }
  
  return (
    <>
      {children}
    </>
  )
  
}

export { Can }