import React from "react";
import { storiesOf } from "@storybook/react";
import ColorButton from "./ColorButton";
import Count from './testHook'

storiesOf("Button", module)
    .add("red",
        () => <ColorButton color="red" />
    )
    .add("blue",
        () => <ColorButton color="blue" />
    ).add("yellow",
        () => <Count/>
    )