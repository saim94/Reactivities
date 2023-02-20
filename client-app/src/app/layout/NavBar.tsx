import { NavLink } from "react-router-dom";
import { Button, Container, Menu } from "semantic-ui-react"

//interface props {
//    openForm: () => void
//}

export default function NavBar(/*{ openForm }: props*/) {

    return (
        <Menu inverted fixed="top">
            <Container>
                <Menu.Item as={NavLink} to='/' header>
                    <img src="/assets/logo.png" alt="logo" style={{ margin: "10px" }} />
                    Reactivities
                </Menu.Item>
                <Menu.Item as={NavLink} to="/activities" name="Activities" />
                <Menu.Item as={NavLink} to="/errors" name="Errors" />
                <Menu.Item>
                    <Button as={NavLink} to="/createActivity" positive content="Create Activity" />
                </Menu.Item>
            </Container>
        </Menu>
    )
}