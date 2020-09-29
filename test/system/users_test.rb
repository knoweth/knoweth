require "application_system_test_case"

class UsersTest < ApplicationSystemTestCase
  test "automated sign works" do
    sign_in_as(users(:alex))
  end

  test "creating a new document" do
    
  end

  private def sign_in_as(user)
    visit new_user_session_url

    fill_in 'user_email', with: user.email
    fill_in 'user_password', with: "test"
    click_on 'Log in'
    assert_equal current_path, root_path
  end
end
