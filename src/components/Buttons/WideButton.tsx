import * as React from "react";
import { StyleSheet, View, Text, Pressable, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type WideButtonProps = {
	variant: "default" | "dark" | "disabled" | "white";
	text: string;
	onPress?: () => void;
	style?: ViewStyle;
};

const WideButton: React.FC<WideButtonProps> = ({
	variant,
	text,
	onPress,
	style,
}) => {
	const [isHovered, setIsHovered] = React.useState(false);
	const [isPressed, setIsPressed] = React.useState(false);

	// Map variant to styles and text colors
	const variantMap = {
		default: {
			containerStyle: [styles.colordefaultChild, (isHovered || isPressed) && styles.hovered],
			textStyle: styles.textWhite,
		},
		dark: {
			containerStyle: [styles.colordarkChild, (isHovered || isPressed) && styles.hovered],
			textStyle: styles.textWhite,
		},
		disabled: {
			containerStyle: styles.colordisabledChild,
			textStyle: styles.textDisabled,
		},
		white: {
			containerStyle: [styles.colorwhiteChild, (isHovered || isPressed) && styles.hoveredWhite],
			textStyle: styles.textGray,
		},
	};

	const { containerStyle, textStyle } =
		variantMap[variant] || variantMap.default;

	return (
		<View style={[styles.wideButton, style]}>
			<Pressable
				style={[styles.buttonContainer]}
				onPress={variant !== "disabled" ? onPress : undefined}
				disabled={variant === "disabled"}
				onHoverIn={() => setIsHovered(true)}
				onHoverOut={() => setIsHovered(false)}
				onPressIn={() => setIsPressed(true)}
				onPressOut={() => setIsPressed(false)}
			>
				<View style={[containerStyle, styles.childPosition]} />
				<Text style={[textStyle, styles.continueTypo]}>{text}</Text>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	wideButton: {
		position: "relative",
		alignItems: "center",
	},
	buttonContainer: {
		minHeight: 46,
		minWidth: "100%",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 9999,
		justifyContent: "center",
		position: "relative",
		alignSelf: "center",
		overflow: "hidden",
	},
	childPosition: {
		borderRadius: 9999,
		...StyleSheet.absoluteFillObject,
	},
	continueTypo: {
		textAlign: "center",
		fontFamily: "NotoSans-Bold",
		fontWeight: "700",
		letterSpacing: -0.3,
		fontSize: 17,
	},
	colordefaultChild: {
		backgroundColor: "#f18437",
	},
	colordarkChild: {
		backgroundColor: "#393939",
	},
	colordisabledChild: {
		backgroundColor: "#d9d9d9",
	},
	colorwhiteChild: {
		backgroundColor: "#fff",
	},
	textWhite: {
		color: "#fff",
	},
	textDisabled: {
		color: "#797979",
	},
	textGray: {
		color: "#393939",
	},
	hovered: {
		opacity: 0.8,
	},
	hoveredWhite: {
		backgroundColor: "#f0f0f0",
	},
});

export default WideButton;
