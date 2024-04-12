# Aspects

**An organizer for combo-making games.**

## What is this?

Aspects is a MEN stack (MongoDB, Express, NodeJS) application that allows the user to keep track of a list of elements, as well as the mixes a player of a combo-making game would be able to craft from them.

For example, we could add an Air aspect and an Earth aspect, then say that those two are an input for a Dust aspect.

## How do I use it?

### Starting the server

1. Ensure you have NPM and NodeJS installed on your machine, and have access to a MongoDB server.
1. Clone this repository to your machine.
1. Run `npm i` in the root directory of the cloned repository to install the dependencies.
1. Copy the `.env.example` file provided in the root directory of the cloned repository into a new `.env` file. Fill it out as necessary.
1. Run `npm start` or `npm run dev` to kick the server up.

### Using the client

1. Open your favorite browser and navigate to the address noted when you kicked up the server.
1. Use the `Add Aspect` section to add new aspects.
1. You can review your existing aspects in the `Aspects` section.
1. Click on an aspect in the `Input Aspects` or `Output Aspects` section to remove it.
1. Drag your desired input aspects to `Input Aspects`, then drag your desired output aspects to `Output Aspects`.
1. Hit the `Clear` button if you'd like to start fresh in the `Input Aspects` and `Output Aspects` sections.

## Notes

The application does not yet have user authorization, so all resources are generated without locking them to a particular user. I recommend using this locally for personal reasons as a result.

As you drag aspects into the `Input Aspects` section, the client will check if there is an existing mix using that combo, and update your `Output Aspects` to that mix's if it does.

As you drag aspects into the `Output Aspects` section, the client will update the outputs for the mix with the given inputs.

As your mixes update, the client will render a PlantUML diagram showing the connections between your aspects. When you have a lot of aspects, this can get wild to look at. If you click the diagram, it will open in a new tab.

The images you upload are hosted in the `public/imgs` directory of the application.