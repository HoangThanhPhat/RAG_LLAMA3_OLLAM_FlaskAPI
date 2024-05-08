// import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { push } from "connected-react-router";
// import * as actions from "../../store/actions";
// import './Login.scss';
// import { FormattedMessage } from 'react-intl';



// class Login extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             username: '',
//             password: '',
//             isShowPassword: false,
//         }
//     }

//     handleOnChangeUsername = (event) => {
//         this.setState({
//             username: event.target.value
//         })
//         console.log(event.target.value)
//     }

//     handleOnChangePassword = (event) => {
//         this.setState({
//             password: event.target.value
//         })
//         console.log(event.target.value)
//     }

//     // handleLogin = () => {
//     //     console.log('username: ', this.state.username, 'password: ', this.state.password)
//     //     console.log('all state ', this.state)
//     // }
//     handleLogin = async () => {
//     try {
//         const response = await fetch('http://localhost:8080/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 username: this.state.username,
//                 password: this.state.password
//             })
//         });

//         const data = await response.json();

//         if (response.ok) {
//             // Lưu user_id vào store Redux sau khi đăng nhập thành công
//             this.props.userLoginSuccess(data.user_id);
//             // Redirect hoặc thực hiện hành động tiếp theo
//             this.props.navigate('/system/user-manage');

//             // Gửi user_id đến route /ask_pdf
//             fetch('http://localhost:8080/ask_pdf', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     user_id: data.user_id
//                 })
//             });
//         } 
        
//         else {
//             if (data.error === 'User not found') {
//                 this.setState({ error: 'User does not have an account. Please sign up.' });
//             } else {
//                 this.setState({ error: 'Incorrect username or password.' });
//             }
//         }
//     } 
//     catch (error) {
//         this.setState({ error: 'Login failed. Please try again.' });
//     }
// };

    
    

//     handleShowHidePassword = () => {
//         this.setState({
//             isShowPassword: !this.state.isShowPassword
//         })
//     }

//     render() {

//         return (
//            <div className='Login_Background'>
//                 <div className='Login_Container'>
//                     <div className='Login_content row'>
//                         <div className='col-12 text-login'>
//                             Login
//                         </div>
//                         <div className='col-12 form-group Login_input'>
//                             <label>Username</label>
//                             <input  type='text' 
//                                     className='form-control' 
//                                     placeholder='Enter your usename'
//                                     // value={this.state.username}
//                                     onChange={(event) => this.handleOnChangeUsername(event)}
//                             >
//                             </input>
//                         </div>
//                         <div className='col-12 form-group Login_input'>
//                             <label>Password</label>
//                             <div className='custom-input-password'>
//                                 <input  type= {this.state.isShowPassword ? 'text' : 'password'}  
//                                         className='form-control'
//                                         placeholder='Enter your password'
//                                         // value={this.state.password}
//                                         onChange={(event) => this.handleOnChangePassword(event)}
//                                 >
//                                 </input>
//                                 <span
//                                     onClick={() => {this.handleShowHidePassword()}}
//                                 >
//                                     <i className={this.state.isShowPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}></i>
//                                 </span>
//                             </div>
//                         </div>
//                         <div className='col-12 mg-0-center'> 
//                             <button className='btn_login'
//                                     onClick={() => {this.handleLogin()}}
//                             >
//                                 Login
//                             </button> 
//                             {this.state.error && <div className="error">{this.state.error}</div>}
//                         </div>
//                         <div className='col-12 text-center mt-3'> <span className='forgot_password'>Forgot your password</span> </div>
//                         <div className='col-12 text-center'>
//                             <span>Orther login with:</span>
//                         </div>
//                         <div className='col-12 social_login'>
//                             <i className="fa-brands fa-google google"></i>
//                             <i className="fa-brands fa-facebook facebook"></i>
//                         </div>
//                         <div className='col-12 text-center mt-3 register'>
//                                 Register
//                         </div>
//                     </div>
//                 </div>
//            </div>

//         )
//     }
// }

// const mapStateToProps = state => {
//     return {
//         language: state.app.language
//     };
// };

// const mapDispatchToProps = dispatch => {
//     return {
//         navigate: (path) => dispatch(push(path)),
//         // userLoginFail: () => dispatch(actions.adminLoginFail()),
//         userLoginSuccess: (userInfo) => dispatch(actions.userLoginSuccess(userInfo))
//     };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(Login);

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from "connected-react-router";
import * as actions from "../../store/actions";
import './Login.scss';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const defaultTheme = createTheme();

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [error, setError] = useState('');

    const dispatch = useDispatch();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                dispatch(actions.userLoginSuccess(data.user_id));
                dispatch(push('/system/user-manage'));

                fetch('http://localhost:8080/ask_pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: data.user_id
                    })
                });
            } else {
                if (data.error === 'User not found') {
                    setError('User does not have an account. Please sign up.');
                } else {
                    setError('Incorrect username or password.');
                }
            }
        } catch (error) {
            setError('Login failed. Please try again.');
        }
    };

    const handleShowHidePassword = () => {
        setIsShowPassword(!isShowPassword);
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Box} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={isShowPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" />}
                                label="Remember me"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <Link href="#" variant="body2">
                                        Forgot password?
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link href="#" variant="body2">
                                        {"Don't have an account? Sign Up"}
                                    </Link>
                                </Grid>
                            </Grid>
                            {error && <div className="error">{error}</div>}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}


