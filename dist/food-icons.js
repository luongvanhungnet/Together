const FOOD_PAIRS=[
 {food:'Carrot',animal:'Rabbit',color:'orange',foodIcon:'carrot',animalIcon:'rabbit'},
 {food:'Banana',animal:'Monkey',color:'yellow',foodIcon:'banana',animalIcon:'monkey'},
 {food:'Bone',animal:'Dog',color:'white',foodIcon:'bone',animalIcon:'dog'},
 {food:'Fish',animal:'Cat',color:'blue',foodIcon:'fish',animalIcon:'cat'}
];
function pairsFor(count){return count===4?FOOD_PAIRS:count===3?[FOOD_PAIRS[0],FOOD_PAIRS[1],FOOD_PAIRS[3]]:FOOD_PAIRS.slice(0,count)}
function pairAt(i){return pairsFor(game().start.length)[i]}
// Locally hosted Twemoji artwork, CC BY 4.0. Attribution is shown in the game.
function foodIcon(name){return `<img src="assets/animals/${name}.svg" class="food-art" alt="" aria-hidden="true" draggable="false" width="64" height="64">`}
