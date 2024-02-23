import { observer } from "mobx-react-lite";
import { Link, NavLink } from "react-router-dom";
import { Button, Container, Dropdown, Icon, Image, Label, Menu } from "semantic-ui-react"
import { useStore } from "../stores/Store";

export default observer(function NavBar() {

    const { userStore: { user, logout }, commonStore: { unReadMessageCount, showLabel } } = useStore();

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
                <Menu.Item position='right'>
                    <Menu.Item position='right'>
                        <Button as={NavLink} to="/inbox" basic size='mini'>
                            <Icon name='envelope' />
                            Inbox
                            {showLabel && unReadMessageCount !== 0 && <Label color='red' floating circular>{unReadMessageCount}</Label>}
                        </Button>

                    </Menu.Item>
                    <Image src={user?.image || '/assets/user.png'} avatar spaced='right' />
                    <Dropdown pointing='top left' text={user?.displayName}>
                        <Dropdown.Menu>
                            <Dropdown.Item as={Link} to={`/profiles/${user?.userName}`}
                                text='My Profile' icon='user' />
                            <Dropdown.Item onClick={logout} text='Logout' icon='power' />
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Item>
            </Container>
        </Menu>
    )
})