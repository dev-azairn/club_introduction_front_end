import type { Route } from "./+types/home";
import Banner from "../components/Banner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MUICT Media and Entertainment Club" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <>
  
  <Banner/>
  </>;
}
