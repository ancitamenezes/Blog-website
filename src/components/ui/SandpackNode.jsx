import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { atomDark } from '@codesandbox/sandpack-themes';

export default function SandpackNode({ node, updateAttributes }) {
    const { code, template } = node.attrs;

    const handleCodeChange = (newCode) => {
        updateAttributes({ code: newCode });
    };

    return (
        <NodeViewWrapper className="sandpack-wrapper my-8 relative group">
            <div className="absolute -top-3 left-4 bg-[#0f0f11] px-2 text-xs font-mono text-emerald-400 z-10 border border-emerald-500/20 rounded-full flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Live {template}
            </div>
            <div className="border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-colors duration-300 group-hover:border-emerald-500/30">
                <Sandpack
                    template={template}
                    theme={atomDark}
                    files={{
                        "/App.js": code,
                    }}
                    options={{
                        showNavigator: false,
                        showLineNumbers: true,
                        editorHeight: 400,
                        classes: {
                            "sp-layout": "!border-none !bg-[#1a1a1a]",
                            "sp-wrapper": "!border-none",
                        }
                    }}
                    customSetup={{
                        dependencies: {
                            "lucide-react": "latest",
                            "framer-motion": "latest"
                        }
                    }}
                />
            </div>
        </NodeViewWrapper>
    );
}
