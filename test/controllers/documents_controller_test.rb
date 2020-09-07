require 'test_helper'

class DocumentsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  test "authenticated users can see documents" do
    sign_in users(:alex)
    get documents_path
    assert_response :success
  end

  test "unauthenticated users cannot see documents" do
    get documents_path
    assert_response :redirect # (to login)
  end
end
