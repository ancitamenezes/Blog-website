import { useState } from 'react';
import { Filter, ChevronDown, Check } from 'lucide-react';

const TECH_STACKS = ['All', 'React', 'Node.js', 'Python', 'AI/ML', 'Mobile', 'UI/UX'];
const EXPERIENCE_LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Expert'];
const LOOKING_FOR = ['Anything', 'Jobs', 'Collaboration', 'Mentoring'];

const CustomSelect = ({ label, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative min-w-[140px]">
            <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1 tracking-wider">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-sm text-gray-300"
            >
                <span className="truncate">{value}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 p-1 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {options.map((opt) => (
                            <button
                                key={opt}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${value === opt ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                onClick={() => {
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                            >
                                {opt}
                                {value === opt && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const FilterBar = ({ filters, setFilters }) => {
    return (
        <div className="glass-card border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 relative z-40">
            <div className="flex items-center gap-2 text-gray-400 mr-4 hidden lg:flex">
                <Filter size={18} />
                <span className="text-sm font-medium">Filters</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full">
                <CustomSelect
                    label="Tech Stack"
                    options={TECH_STACKS}
                    value={filters.tech}
                    onChange={(v) => setFilters({ ...filters, tech: v })}
                />

                <CustomSelect
                    label="Experience"
                    options={EXPERIENCE_LEVELS}
                    value={filters.experience}
                    onChange={(v) => setFilters({ ...filters, experience: v })}
                />

                <CustomSelect
                    label="Looking For"
                    options={LOOKING_FOR}
                    value={filters.lookingFor}
                    onChange={(v) => setFilters({ ...filters, lookingFor: v })}
                />

                {/* Distance Slider */}
                <div className="flex-1 min-w-[200px] ml-auto">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Distance</label>
                        <span className="text-xs text-primary font-mono">{filters.distance} km</span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={filters.distance}
                        onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 mt-1 font-mono">
                        <span>5km</span>
                        <span>100km</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
