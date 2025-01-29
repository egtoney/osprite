import React from "react";

export function Loading(props: { loaded: boolean } & React.PropsWithChildren) {
	return props.loaded ? props.children : <div></div>;
}
