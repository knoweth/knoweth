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

  test "can create a new document with valid initial content" do
    sign_in users(:alex)
    post "/documents", params: {
      document: {
        title: "test"
      }
    }
    assert_response :redirect
    follow_redirect!
    assert_response :success

    # The document's initial JSON should be valid.
    JSON.parse Document.where(title: "test").first.content
  end

  test "can delete document" do
    sign_in users(:alex)
    post "/documents", params: {
      document: {
        title: "test"
      }
    }
    assert_response :redirect
    follow_redirect!
    assert_response :success

    delete path
    assert_response :redirect
    follow_redirect!
    assert_response :success
    assert_equal "/documents", path
    assert_equal "Successfully deleted document.", flash[:notice]
  end
end
