import localFont from 'next/font/local'


export const Urbanist = localFont({
  src: [
    {
      path: "../assets/fonts/Urbanist-ExtraLight.ttf",
      weight: "200",
      style: "normal"
    },
    {
      path: "../assets/fonts/Urbanist-Light.ttf",
      weight: "300",
      style: "normal"
    },
    {
      path: "../assets/fonts/Urbanist-Regular.ttf",
      weight: "400",
      style: "normal"
    },
    {
      path: "../assets/fonts/Urbanist-Medium.ttf",
      weight: "500",
      style: "normal"
    },
    {
      path: "../assets/fonts/Urbanist-SemiBold.ttf",
      weight: "600",
      style: "normal"
    },
    {
      path: "../assets/fonts/Urbanist-Bold.ttf",
      weight: "700",
      style: "normal"
    },
    {
      path: "../assets/fonts/Urbanist-ExtraBold.ttf",
      weight: "800",
      style: "normal"
    },
  ],
  variable: "--font-urbanist",
});

export const Quicksand = localFont({
  src: [
    {
      path: "../assets/fonts/Quicksand-Light.ttf",
      weight: "300",
      style: "normal"
    },
    {
      path: "../assets/fonts/Quicksand-Regular.ttf",
      weight: "400",
      style: "normal"
    },
    {
      path: "../assets/fonts/Quicksand-Medium.ttf",
      weight: "500",
      style: "normal"
    },
    {
      path: "../assets/fonts/Quicksand-SemiBold.ttf",
      weight: "600",
      style: "normal"
    },
    {
      path: "../assets/fonts/Quicksand-Bold.ttf",
      weight: "700",
      style: "normal"
    },
  ],
  variable: "--font-quicksand",
});
