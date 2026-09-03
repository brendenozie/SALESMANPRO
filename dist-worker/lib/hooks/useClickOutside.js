"use strict";
// lib/hooks/useClickOutside.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.useClickOutside = void 0;
const react_1 = require("react");
function useClickOutside(ref, handler) {
    (0, react_1.useEffect)(() => {
        const listener = (event) => {
            // Do nothing if clicking ref's element or descendent elements
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}
exports.useClickOutside = useClickOutside;
