require "application_system_test_case"

class UsersTest < ApplicationSystemTestCase
  test "automated sign-in works" do
    sign_in_as(users(:alex))
  end
end
