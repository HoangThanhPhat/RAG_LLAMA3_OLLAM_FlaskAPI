import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import './UserManage.scss';
class UserManage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            showModal: false,
            successMessage: '',
            errorMessage: '',
            formData: {
                email: '',
                password: '',
                firstname: '',
                lastname: '',
                username: '',
                DoB: '',
                address: '',
                phone: '',
                roleID: '',
            },
            userToDelete: null,
            userToUpdate: null,
            updatedUserData: {
                // Dữ liệu mới sau khi cập nhật
                email: '',
                password: '',
                firstname: '',
                lastname: '',
                username: '',
                DoB: '',
                address: '',
                phone: '',
                roleID: '',
            },
            historyQuestions: [],
            showHistoryModal: false 
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [name]: value
            }
        }));
    }

    componentDidMount() {
        // Gọi API khi component được mount
        axios.get('http://localhost:8080/users')
            .then(response => {
                // Lấy dữ liệu từ response và cập nhật vào state
                this.setState({ users: response.data });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    handleSearch = () => {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        console.log('Search term:', searchTerm);
        const filteredUsers = this.state.users.filter(user => user.username.toLowerCase().includes(searchTerm));
        console.log('Filtered users:', filteredUsers);
        this.setState({ filteredUsers });
    };
    

    handleCreateUser = () => {
        // Mở modal khi nhấn nút "Create User"
        this.setState({ showModal: true });
        
    };

    handleClose = () => {
        // Đóng modal
        this.setState({ showModal: false });
    };

    handleCreate = () => {
        // Gửi yêu cầu POST đến URL backend
        axios.post('http://localhost:8080/create_user', this.state.formData)
            .then(response => {
                // Xử lý phản hồi từ backend nếu cần
                console.log('User created successfully:', response.data);
                // Đóng modal sau khi tạo user thành công
                this.setState({ 
                    showModal: false,
                    successMessage: 'User created successfully',
                    errorMessage: ''
                });
            })
            .catch(error => {
                // Xử lý lỗi từ backend
                console.error('Error creating user:', error);
                // Cập nhật state để hiển thị thông báo lỗi
                this.setState({ 
                    errorMessage: 'Error creating user. Please try again.',
                    successMessage: ''
                });
            });
    };
    
    handleDelete = (username) => {
        // Đặt người dùng cần xóa vào state trước khi hiển thị cảnh báo
        this.setState({ userToDelete: username });
    };

    confirmDelete = () => {
        // Xác nhận xóa người dùng và gửi yêu cầu DELETE đến backend
        const username = this.state.userToDelete;
        axios.delete(`http://localhost:8080/user/${username}`)
            .then(response => {
                // Xử lý phản hồi từ backend nếu cần
                console.log('User deleted successfully:', response.data);
                // Cập nhật danh sách người dùng sau khi xóa
                this.setState(prevState => ({
                    users: prevState.users.filter(user => user.username !== username),
                    userToDelete: null // Đặt lại userToDelete về null sau khi xóa thành công
                }));
            })
            .catch(error => {
                // Xử lý lỗi từ backend
                console.error('Error deleting user:', error);
            });
    };

    handleUpdate = (user) => {
        // Đặt thông tin người dùng cần cập nhật vào state trước khi hiển thị modal
        this.setState({ 
            userToUpdate: user,
            updatedUserData: { ...user } // Copy dữ liệu cũ vào dữ liệu mới
        });
    };

    confirmUpdate = () => {
        // Gửi yêu cầu PUT đến backend để cập nhật thông tin người dùng
        const { username } = this.state.userToUpdate;
        axios.put(`http://localhost:8080/user/${username}`, this.state.updatedUserData)
            .then(response => {
                // Xử lý phản hồi từ backend nếu cần
                console.log('User updated successfully:', response.data);
                // Cập nhật danh sách người dùng sau khi cập nhật thành công
                this.setState(prevState => ({
                    users: prevState.users.map(user => {
                        if (user.username === username) {
                            return { ...user, ...prevState.updatedUserData }; // Cập nhật dữ liệu mới
                        }
                        return user;
                    }),
                    userToUpdate: null // Đặt lại userToUpdate về null sau khi cập nhật thành công
                }));
            })
            .catch(error => {
                // Xử lý lỗi từ backend
                console.error('Error updating user:', error);
            });
    };

    handleInputChange = (e) => {
        // Cập nhật dữ liệu mới khi người dùng nhập vào các trường input
        const { name, value } = e.target;
        this.setState(prevState => ({
            updatedUserData: {
                ...prevState.updatedUserData,
                [name]: value
            }
        }));
    };

    handleOpenHistoryModal = (userId) => {
        // Gọi API để lấy lịch sử câu hỏi và câu trả lời của người dùng từ URL: http://localhost:8080/qna/<user_id>
        axios.get(`http://localhost:8080/qna/${userId}`)
            .then(response => {
                // Lấy dữ liệu từ phản hồi và cập nhật vào state để hiển thị trong modal
                this.setState({ 
                    historyQuestions: response.data,
                    showHistoryModal: true // Sửa thành showHistoryModal
                });
            })
            .catch(error => {
                console.error('Error fetching history questions:', error);
            });
    };
    
    
    handleCloseHistoryModal = () => {
        // Đóng modal lịch sử
        this.setState({ showHistoryModal: false });
    };

    render() {
        return (
            <div className="users-container">
                <div className="title text-center">
                    Manage User
                    
                </div>
                <div className="users-search mx-3 mt-2 d-flex justify-content-between">
                    <div className="d-flex">
                        <input id="searchInput" type='text' className="form-control" placeholder='Username' />
                        <button className='btn btn-outline-success ml-2' onClick={this.handleSearch}>Search</button>
                    </div>
                    <button className='btn btn-outline-success' onClick={this.handleCreateUser}>Create User</button>
                </div>
                <div className="users-table mt-4 mx-2 text-center">
                    <table id="customers" className='text-center'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Username</th>
                                <th>Date of Birth</th>
                                <th>Address</th>
                                <th>Phone</th>
                                <th>Role ID</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Duyệt qua mảng filteredUsers (nếu tồn tại) hoặc users (nếu không tồn tại) và hiển thị thông tin */}
                            {(this.state.filteredUsers && this.state.filteredUsers.length > 0 ? this.state.filteredUsers : this.state.users).map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.firstname}</td>
                                    <td>{user.lastname}</td>
                                    <td>{user.username}</td>
                                    <td>{user.DoB}</td>
                                    <td>{user.address}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.roleID}</td>
                                    <td>
                                        <div className="btn-group" role="group">
                                            <button className="btn btn-outline-secondary btn-sm mr-1" style={{ marginRight: '5px', borderRadius: '5px' }} onClick={() => this.handleUpdate(user)}>Update</button>
                                            <button className="btn btn-outline-success btn-sm mr-1" onClick={() => this.handleOpenHistoryModal(user.id)}>History Question</button>
                                            <button className="btn btn-outline-danger btn-sm" onClick={() => this.handleDelete(user.username)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Modal show={this.state.showModal} onHide={this.handleClose}>
                    <Modal.Header>
                    <Modal.Title>Create User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <div className="form-group">
                                <label>First Name:</label>
                                <input type="text" className="form-control" name="firstname" value={this.state.formData.firstname} onChange={this.handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Last Name:</label>
                                <input type="text" className="form-control" name="lastname" value={this.state.formData.lastname} onChange={this.handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input type="text" className="form-control" name="email" value={this.state.formData.email} onChange={this.handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Username:</label>
                                <input type="text" className="form-control" name="username" value={this.state.formData.username} onChange={this.handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Password:</label>
                                <input type="text" className="form-control" name="password" value={this.state.formData.password} onChange={this.handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Day of Birth:</label>
                                <input type="text" className="form-control" name="DoB" value={this.state.formData.DoB} onChange={this.handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Address:</label>
                                <input type="text" className="form-control" name="address" value={this.state.formData.address} onChange={this.handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Phone Number:</label>
                                <input type="text" className="form-control" name="phone" value={this.state.formData.phone} onChange={this.handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Role ID:</label>
                                <input type="text" className="form-control" name="roleID" value={this.state.formData.roleID} onChange={this.handleChange} />
                            </div>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        {/* Thông báo thành công và lỗi */}
                        {this.state.successMessage && (
                            <div className="alert alert-success" role="alert">
                                {this.state.successMessage}
                            </div>
                        )}
                        {this.state.errorMessage && (
                            <div className="alert alert-danger" role="alert">
                                {this.state.errorMessage}
                            </div>
                        )}
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={this.handleCreate}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Pop up Delete */}
                <Modal show={this.state.userToDelete !== null} onHide={() => this.setState({ userToDelete: null })}>
                    <Modal.Header>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete this user?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.setState({ userToDelete: null })}>Cancel</Button>
                        <Button variant="danger" onClick={this.confirmDelete}>Delete</Button>
                    </Modal.Footer>
                </Modal>

                {/* Pop up Update */}
                <Modal show={this.state.userToUpdate !== null} onHide={() => this.setState({ userToUpdate: null })}>
                    <Modal.Header>
                        <Modal.Title>Update User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6">
                                {/* Hiển thị thông tin cũ */}
                                <h5>Current Information:</h5>
                                {/* Hiển thị thông tin cũ của người dùng */}
                                {/* Ví dụ: */}
                                <p>Email: {this.state.userToUpdate && this.state.userToUpdate.email}</p>
                                <p>First Name: {this.state.userToUpdate && this.state.userToUpdate.firstname}</p>
                                <p>Last Name: {this.state.userToUpdate && this.state.userToUpdate.lastname}</p>
                                <p>Username: {this.state.userToUpdate && this.state.userToUpdate.username}</p>
                                <p>Day of Birth: {this.state.userToUpdate && this.state.userToUpdate.DoB}</p>
                                <p>Address: {this.state.userToUpdate && this.state.userToUpdate.address}</p>
                                <p>Phone Number: {this.state.userToUpdate && this.state.userToUpdate.phone}</p>
                                <p>Role ID: {this.state.userToUpdate && this.state.userToUpdate.roleID}</p>

                            </div>
                            <div className="col-md-6">
                                {/* Form nhập thông tin mới */}
                                <h5>New Information:</h5>
                                <form>
                                    <div className="form-group">
                                        <label>First Name:</label>
                                        <input type="text" className="form-control" name="firstname"  onChange={this.handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name:</label>
                                        <input type="text" className="form-control" name="lastname"  onChange={this.handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Username:</label>
                                        <input type="text" className="form-control" name="username"  onChange={this.handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Password:</label>
                                        <input type="text" className="form-control" name="password"  onChange={this.handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email:</label>
                                        <input type="text" className="form-control" name="email"  onChange={this.handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Day of Birth:</label>
                                        <input type="text" className="form-control" name="DoB"  onChange={this.handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Address:</label>
                                        <input type="text" className="form-control" name="address"  onChange={this.handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number:</label>
                                        <input type="text" className="form-control" name="phone"  onChange={this.handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Role ID:</label>
                                        <input type="text" className="form-control" name="roleID"  onChange={this.handleInputChange} />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.setState({ userToUpdate: null })}>Cancel</Button>
                        <Button variant="primary" onClick={this.confirmUpdate}>Update</Button>
                    </Modal.Footer>
                </Modal>
                {/* Pop up history question */}
                <Modal show={this.state.showHistoryModal} onHide={this.handleCloseHistoryModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>History Question</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* Hiển thị lịch sử câu hỏi và câu trả lời của người dùng */}
                        {this.state.historyQuestions.map((item, index) => (
                            <div key={index}>
                                <p><strong>Question:</strong> {item.question}</p>
                                <p><strong>Answer:</strong> {item.answer}</p>
                            </div>
                        ))}
                    </Modal.Body>
                </Modal>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserManage);
