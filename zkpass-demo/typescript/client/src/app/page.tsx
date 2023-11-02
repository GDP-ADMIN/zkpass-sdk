"use client";

import * as React from "react";
import HeaderBar from "@components/header";
import { Paper, TextField, Button, Card, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Home() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();

  const _handleLogin = () => {
    fetch("http://localhost:3001/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        console.log(res);
        interface LoginResponse {
          status: number;
          message: string;
        }
        const body: LoginResponse = await res.json();
        console.log(body);
        if (body.status == 200) {
          router.push("/users");
        } else {
          setMessage(body.message);
          setOpen(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <HeaderBar user={undefined} />
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        message={message}
      />
      <div className="flex justify-center items-center h-screen">
        <Paper
          elevation={3}
          className="w-2/5 p-7 flex flex-col items-center gap-5"
        >
          <div className="text-lg">ZKPass Demo : My Namaste</div>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            className="w-4/6"
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            variant="outlined"
            className="w-4/6"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="outlined" onClick={_handleLogin}>
            Login
          </Button>
        </Paper>
      </div>
    </>
  );
}