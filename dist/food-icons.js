const FOOD_PAIRS=[
 {food:'Carrot',animal:'Rabbit',color:'orange',foodIcon:'carrot',animalIcon:'rabbit'},
 {food:'Banana',animal:'Monkey',color:'yellow',foodIcon:'banana',animalIcon:'monkey'},
 {food:'Bone',animal:'Dog',color:'white',foodIcon:'bone',animalIcon:'dog'},
 {food:'Fish',animal:'Cat',color:'blue',foodIcon:'fish',animalIcon:'cat'}
];
function pairsFor(count){return count===4?FOOD_PAIRS:count===3?[FOOD_PAIRS[0],FOOD_PAIRS[1],FOOD_PAIRS[3]]:FOOD_PAIRS.slice(0,count)}
function pairAt(i){return pairsFor(game().start.length)[i]}
const ICON_PATHS={
 carrot:`<path d="M30 19 37 7 43 9 39 21 52 14 56 20 42 28Z" fill="#82b94d"/><path d="M29 19C19 23 10 42 6 57 22 53 42 40 45 29 45 23 35 17 29 19Z" fill="currentColor"/><path d="m24 29 6 4m-13 6 6 3m8-5 5 3" fill="none"/>`,
 banana:`<path d="M13 9C17 31 33 40 53 24 50 44 37 57 24 52 12 48 7 31 9 14Z" fill="currentColor"/><path d="M14 14C16 34 29 47 44 37" fill="none" stroke="#ad7b25"/><path d="m10 14-1-7 6-2 3 8M51 25l5-5" stroke="#674a25" fill="none"/>`,
 bone:`<g transform="rotate(-35 32 32)"><path d="M20 25H44C43 17 52 14 56 20 64 20 65 30 58 32 65 34 64 44 56 44 52 50 43 47 44 39H20C21 47 12 50 8 44 0 44-1 34 6 32-1 30 0 20 8 20 12 14 21 17 20 25Z" fill="currentColor"/></g>`,
 fish:`<path d="m16 32-13-14v28ZM15 32C25 11 49 13 60 32 49 51 25 53 15 32Z" fill="currentColor"/><path d="m30 20 4-12 12 11m-17 27 10 9 7-12" fill="currentColor"/><path d="M42 22c-6 6-6 14 0 20" fill="none"/><circle cx="49" cy="29" r="2.5" fill="#14231e" stroke="none"/>`,
 rabbit:`<ellipse cx="23" cy="18" rx="7" ry="16" fill="currentColor"/><ellipse cx="41" cy="18" rx="7" ry="16" fill="currentColor"/><path d="M23 7v18m18-18v18" stroke="#ffe5bf" stroke-width="3"/><ellipse cx="32" cy="43" rx="23" ry="19" fill="currentColor"/><ellipse cx="32" cy="49" rx="12" ry="9" fill="#fff4df" stroke="none"/><circle cx="23" cy="39" r="2.2" fill="#16251d"/><circle cx="41" cy="39" r="2.2" fill="#16251d"/><path d="m29 46 3 3 3-3m-3 3v5m-4-1 4 2 4-2" fill="none"/>`,
 monkey:`<circle cx="9" cy="34" r="8" fill="currentColor"/><circle cx="55" cy="34" r="8" fill="currentColor"/><circle cx="9" cy="34" r="4" fill="#ffe9b2" stroke="none"/><circle cx="55" cy="34" r="4" fill="#ffe9b2" stroke="none"/><path d="M14 28C13 16 23 11 29 14l-3-9 10 5 5-6 2 12c9 2 11 12 9 23L48 51C35 65 13 53 13 38Z" fill="currentColor"/><path d="M20 29c4-6 10-4 12 0 3-5 12-5 14 1v16c-5 12-23 10-27-1Z" fill="#ffe9b2" stroke="none"/><circle cx="25" cy="33" r="2" fill="#16251d"/><circle cx="40" cy="33" r="2" fill="#16251d"/><path d="m29 42 3-2 3 2m-11 5q8 8 16 0" fill="none"/>`,
 dog:`<path d="M19 17C9 10 3 20 3 32S7 49 14 44l7-17m24-10c10-7 16 3 16 15s-4 17-11 12l-7-17" fill="#a5b0ba"/><path d="M17 20c3-13 27-13 31 0l2 20c-1 14-35 14-36 0Z" fill="currentColor"/><path d="M23 33c2-7 17-7 19 0l2 19c-3 14-22 14-25 0Z" fill="#fffef6"/><circle cx="23" cy="27" r="2.2" fill="#16251d"/><circle cx="41" cy="27" r="2.2" fill="#16251d"/><path d="M25 43q7-5 14 0l-7 6Z" fill="#16251d"/><path d="M32 49v6m-5-1 5 3 5-3" fill="none"/>`,
 cat:`<path d="M13 32 9 5 28 18h8L55 5l-4 27c11 22-4 28-19 28S3 53 13 32Z" fill="currentColor"/><path d="m14 13 3 14 7-7m26-7-3 14-7-7" fill="#c1edff" stroke="none"/><circle cx="22" cy="35" r="2.5" fill="#16251d"/><circle cx="42" cy="35" r="2.5" fill="#16251d"/><path d="m29 42 3 3 3-3m-3 3v6m-5-2 5 3 5-3M17 42 3 38m14 8L2 46m16 4L4 55m43-13 14-4m-14 8h15m-16 4 14 5" fill="none"/>`
};
function foodIcon(name){return `<svg viewBox="0 0 64 64" class="food-art" aria-hidden="true" focusable="false" fill="none" stroke="#17271f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`}
