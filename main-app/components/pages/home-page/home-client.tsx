'use client'

import React from "react";
import { useAgentOnboardingModal, useOpenMobileMenu, useUserOnboardingModal } from "@/hooks/general-store";
import HeroSection from "./hero-section";
import WhyUs from "./why-us";
import FeaturedProperties from "./featured-properties";
import LatestBlogs from "./latest-blogs";
import TestimonialSection from "./testimonial-section";
import { cn } from "@/lib/utils";

const HomeClient = ({user}:{user:any}) => {
  const { isOpen } = useOpenMobileMenu();
  const onboardingUser = useUserOnboardingModal();
  const onboardingAgent = useAgentOnboardingModal();

  React.useLayoutEffect(() => {
    if (user && user.userOnboarded === false && user.profileCreated === false) {
      if (user.role === 'agent') {
        onboardingAgent.onOpen();
      };

      if (user.role === 'user') {
        onboardingUser.onOpen();
      };
    }

  },[user, user?.role ]);


  return (
    <div className={cn("", isOpen && 'h-screen overflow-hidden')}>
      <HeroSection/>
      <WhyUs/>
      <FeaturedProperties/>
      <LatestBlogs/>
      <TestimonialSection/>
    </div>
  );
};

export default HomeClient;