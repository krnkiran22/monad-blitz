import Spline from '@splinetool/react-spline';

const Home = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Main Spline component */}
      <Spline scene="https://prod.spline.design/MaDCOHnRuptcKeiK/scene.splinecode" />
    </div>
  );
};

export default Home;