import  {Container} from "@mantine/core";
import styles from "./index.module.css";

export default function Index() {
    return (
        <Container className={styles.index}>
            This is a demo for Remix.
            <br />
            Check out{" "}
            <a href="https://remix.run">the docs at remix.run</a>.
        </Container>
    );
}