import React from "react"
import { Button, Container, Menu } from "semantic-ui-react"

interface props {
    openForm: () => void
}

export default function NavBar({ openForm }: props) {
    return (
        <Menu inverted fixed="top">
            <Container>
                <Menu.Item header>
                    <img src="/assets/logo.png" alt="logo" style={{ margin: "10px" }} />
                    Reactivities
                </Menu.Item>
                <Menu.Item name="Activities" />
                <Menu.Item>
                    <Button onClick={openForm} positive content="Create Activity" />
                </Menu.Item>
            </Container>
        </Menu>
    )
}