import React from 'react';
import { Duck } from './demo';

interface propes {
	duck: Duck;
}

export default function ({ duck }: propes) {
	return (
		<div>
			<span>{duck.name}</span>
			<button onClick={() => duck.makeSound(duck.name + ' quack')}>Make Sound</button>
		</div>

	);
}