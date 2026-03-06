// A lightweight, zero-dependency utility to synthesize UI sounds using the Web Audio API.
// Creates soft, minimal sounds that don't distract the user.

let audioCtx = null;

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

// Mute toggle state (optional if user wants to silence)
let isMuted = false;

export const setMuted = (muted) => {
    isMuted = muted;
};

export const playSound = (type, volume = 0.05) => {
    if (isMuted) return;

    try {
        const ctx = getAudioContext();
        const t = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        switch (type) {
            case 'pop': // Like button
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
                gain.gain.setValueAtTime(volume, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case 'message': // Receive message
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.linearRampToValueAtTime(700, t + 0.05);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(volume, t + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                osc.start(t);
                osc.stop(t + 0.15);
                break;

            case 'notification': // Notification received
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.setValueAtTime(1200, t + 0.1);

                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(volume, t + 0.02);
                gain.gain.linearRampToValueAtTime(0.001, t + 0.09);
                gain.gain.setValueAtTime(0, t + 0.1);
                gain.gain.linearRampToValueAtTime(volume, t + 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

                osc.start(t);
                osc.stop(t + 0.3);
                break;

            case 'follow': // Follow user (happy chime / ba-ding)
                // Note 1 (ba)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, t); // Starts lower

                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(volume * 0.7, t + 0.02);
                gain.gain.linearRampToValueAtTime(0, t + 0.1);

                osc.start(t);
                osc.stop(t + 0.1);

                // Note 2 (ding)
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);

                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(900, t + 0.1); // Jumps up

                gain2.gain.setValueAtTime(0, t + 0.1);
                gain2.gain.linearRampToValueAtTime(volume, t + 0.12);
                gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

                osc2.start(t + 0.1);
                osc2.stop(t + 0.4);
                break;

            default:
                break;
        }
    } catch (e) {
        console.warn("Audio context not initialized or blocked:", e);
    }
};
