import {json, LoaderFunctionArgs, redirect} from "@remix-run/node";
import '@mantine/core/styles.css';
import {cssBundleHref} from '@remix-run/css-bundle';
import {
    Form,
    Links,
    LiveReload,
    Meta,
    Scripts,
    ScrollRestoration,
    Outlet,
    useLoaderData,
    useNavigation,
    useSubmit,
} from "@remix-run/react";

import {getContacts, createEmptyContact} from "~/data";

import type {LinksFunction} from "@remix-run/node";
import {ColorSchemeScript, MantineProvider, Button, createTheme, AppShell, Text, Input, Container, NavLink} from '@mantine/core';
import {useEffect, useState} from "react";
import {useDisclosure} from "@mantine/hooks";

export const links: LinksFunction = () => [
    ...(cssBundleHref
        ? [{rel: 'stylesheet', href: cssBundleHref}]
        : []),
];

export const action = async () => {
    const contact = await createEmptyContact();
    return redirect(`/contacts/${contact.id}/edit`);
};
export const loader = async ({request}: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const contacts = await getContacts(q);
    return json({contacts, q});
};

const theme = createTheme({
    components: {
        Button: Button.extend({
            defaultProps: {
                color: 'cyan',
                variant: 'outline',
                autoContrast: true,

            },
        }),
    },
});

export default function App() {
    const {contacts, q} = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const submit = useSubmit();
    const searching = navigation.location && new URLSearchParams(navigation.location.search).has("q");

    const [query, setQuery] = useState(q || "");

    const [mobileOpened, {toggle: toggleMobile}] = useDisclosure();
    const [desktopOpened, {toggle: toggleDesktop}] =
        useDisclosure(true);


    useEffect(() => {
        setQuery(q || "");
    }, [q]);


    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <Meta/>
            <Links/>
            <ColorSchemeScript/>
        </head>
        <body>
        <MantineProvider theme={theme}>
            <AppShell padding="md"
                      header={{height: 60}}
                      navbar={{
                          width: 300,
                          breakpoint: 'sm',
                          collapsed: {mobile: !mobileOpened, desktop: !desktopOpened},
                      }}>
                <AppShell.Header withBorder={true}>
                    <div>
                        <Text mb="sm" mt="sm" ml="sm" ff="heading" fz="26" fs="italic" fw="bold">Remix Contacts</Text>
                    </div>
                </AppShell.Header>
                <AppShell.Navbar>
                    <div id="sidebar">
                        <Container m={8}>
                            <Form id="search-form"
                                  role="search"
                                  onChange={(event) => {
                                      const isFirstSearch = q === null;
                                      submit(event.currentTarget, {
                                          replace: !isFirstSearch,
                                      });
                                  }}>
                                <Input
                                    mb={12}
                                    mr={12}
                                    id="q"
                                    aria-label="Search contacts"
                                    className={searching ? "loading" : ""}
                                    placeholder="Search"
                                    value={query}
                                    type="search"
                                    name="q"
                                    onChange={(event) =>
                                        setQuery(event.currentTarget.value)
                                    }
                                />
                                <div id="search-spinner" aria-hidden hidden={!searching}/>
                            </Form>
                            <Form method="post">
                                <Button type="submit">New</Button>
                            </Form>
                        </Container>
                        <nav>
                            {contacts.length ? (
                                <ul>
                                    {contacts.map((contact) => (
                                        <li key={contact.id}>
                                            <NavLink
                                                className={({isActive, isPending}) =>
                                                    isActive
                                                        ? "active"
                                                        : isPending
                                                            ? "pending"
                                                            : ""
                                                }
                                                to={`contacts/${contact.id}`}
                                            >
                                                {contact.first || contact.last ? (
                                                    <>
                                                        {contact.first} {contact.last}
                                                    </>
                                                ) : (
                                                    <i>No Name</i>
                                                )}{" "}
                                                {contact.favorite ? (
                                                    <span>★</span>
                                                ) : null}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p>
                                    <i>No contacts</i>
                                </p>
                            )
                            }
                        </nav>
                    </div>
                </AppShell.Navbar>
                <AppShell.Main>
                    <div id="detail" className={navigation.state === "loading" && !searching ? "loading" : ""}>
                        <Outlet/>
                    </div>
                </AppShell.Main>
                <ScrollRestoration/>
                <Scripts/>
                <LiveReload/>
            </AppShell>
        </MantineProvider>
        </body>
        </html>
    );
}