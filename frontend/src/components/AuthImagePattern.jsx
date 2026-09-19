const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-base-200 p-12 relative overflow-hidden">
      {/* Professional geometric background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-accent/20 rounded-full blur-3xl mix-blend-multiply"></div>
      </div>
      
      <div className="max-w-md text-center relative z-10">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
            <div className="w-12 h-12 bg-primary rounded-xl opacity-80 shadow-md"></div>
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">{title}</h2>
        <p className="text-base-content/70 text-lg leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
