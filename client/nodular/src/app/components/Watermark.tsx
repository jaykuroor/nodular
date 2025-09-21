export default function Watermark() {
    return (
        <div className="fixed group bottom-10 right-10 z-10 text-xl text-slate-100/50 select-none hover:text-slate-50/60">
            Made with <a href="https://reactflow.dev/" target="_blank" className="font-medium text-slate-50/80 hover:underline hover:text-white group-hover:text-white">ReactFlow</a>
        </div>
    );
}