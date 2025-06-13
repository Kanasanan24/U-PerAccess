import { lazy, Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const MainDashboardPage = lazy(() => import("./pages/MainDashboardPage"));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div></div>}>
        <Routes>
          <Route path='/' element={<LandingPage />}></Route>
          <Route path='/dashboard' element={<MainDashboardPage />}></Route>
        </Routes>
      </Suspense>
      <ToastContainer className="!z-[99999999]" />
    </BrowserRouter>
  );
}

export default App;