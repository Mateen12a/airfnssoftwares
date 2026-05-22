import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/Navbar";
import ScrollProgress from "./components/ScrollProgress";
import Hero from "./components/Hero";
import WhatWeDo from "./components/WhatWeDo";
import WhyAirFns from "./components/WhyAirFns";
import WorkAndProducts from "./components/WorkAndProducts";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import DayaInvite from "./pages/DayaInvite";
import DayaAdmin from "./pages/DayaAdmin";

const queryClient = new QueryClient();

function Home() {
  return (
    <main>
      <ScrollProgress />
      <Navbar />
      <Hero />
      <WhatWeDo />
      <WhyAirFns />
      <WorkAndProducts />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/daya-motives" component={DayaInvite} />
      <Route path="/daya-motives/admin" component={DayaAdmin} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
