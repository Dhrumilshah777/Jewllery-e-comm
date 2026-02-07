const Spinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative flex flex-col items-center justify-center">
        {/* Outer rotating ring */}
        <div className="absolute h-20 w-20 rounded-full border-[3px] border-transparent border-t-indigo-900 border-r-indigo-900 animate-[spin_1.5s_linear_infinite]" />
        
        {/* Inner rotating ring (reverse) */}
        <div className="absolute h-14 w-14 rounded-full border-[3px] border-transparent border-b-indigo-400 border-l-indigo-400 animate-[spin_2s_linear_infinite_reverse]" />
        
        {/* Center Logo/Text */}
        <div className="z-10 flex flex-col items-center animate-pulse">
             <span className="text-xl font-serif font-bold text-gray-800 tracking-widest">AO</span>
        </div>
        
        {/* Loading text below */}
        <div className="absolute -bottom-12">
            <span className="text-xs font-medium tracking-[0.3em] text-gray-500 uppercase">Loading</span>
        </div>
      </div>
    </div>
  );
};

export default Spinner;
