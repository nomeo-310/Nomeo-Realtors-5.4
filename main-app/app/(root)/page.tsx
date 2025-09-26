import React from "react";
import HomeClient from "@/components/pages/home-page/home-client";
import { getCurrentUser } from "@/actions/user-actions";

const Home = async () => {
  const user = await getCurrentUser();
  
  return <HomeClient user={user}/>
};

export default Home;
