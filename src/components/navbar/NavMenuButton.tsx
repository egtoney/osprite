export function NavMenuButton(
	props: {
		name: string;
		setOpen: (open: boolean) => void;
		onClick: () => void;
	} & React.PropsWithChildren,
) {
	return (
		<button
			onClick={() => {
				props.setOpen(false);
				props.onClick();
			}}
		>
			{props.name}
			{props.children}
		</button>
	);
}
