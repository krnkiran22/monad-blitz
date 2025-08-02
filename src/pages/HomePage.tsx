import Spline from '@splinetool/react-spline';

const Home = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Main Spline component */}
      <Spline 
        scene="https://prod.spline.design/MaDCOHnRuptcKeiK/scene.splinecode"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default Home;